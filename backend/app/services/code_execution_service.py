import os
import sys
import traceback
import logging
import time
import json
import importlib.util
import tempfile
import shutil
from typing import Dict, Any, Optional, List, Union, Tuple
import asyncio
import subprocess
import psutil
import io
import contextlib
from pathlib import Path

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

from app.core.config import settings
from app.schemas.llm import CodeExecutionResult

logger = logging.getLogger(__name__)

class CodeExecutionService:
    def __init__(self):
        # Create a sandbox directory
        self.sandbox_dir = os.path.join(settings.upload_dir, "sandbox")
        os.makedirs(self.sandbox_dir, exist_ok=True)
        
        # Configure timeouts and memory limits
        self.timeout = settings.sandbox_timeout
        self.max_memory = settings.max_memory
    
    async def execute_code(
        self,
        code: str,
        file_path: str,
        execution_type: str = "python"
    ) -> CodeExecutionResult:
        """
        Execute user code in a sandbox environment.
        """
        start_time = time.time()
        
        if execution_type != "python":
            return CodeExecutionResult(
                output="Unsupported execution type. Only Python is supported.",
                error="UnsupportedExecutionType",
                visualizations=None,
                tables=None,
                execution_time=0.0
            )
        
        # Create a temporary directory for this execution
        execution_id = f"exec_{int(time.time())}_{id(code) % 10000}"
        execution_dir = os.path.join(self.sandbox_dir, execution_id)
        os.makedirs(execution_dir, exist_ok=True)
        
        try:
            # Prepare the code with safety wrappers
            wrapped_code = self._prepare_code(code, file_path, execution_dir)
            
            # Write code to file
            code_file = os.path.join(execution_dir, "code.py")
            with open(code_file, "w") as f:
                f.write(wrapped_code)
            
            # Execute in subprocess for isolation
            result = await self._execute_in_subprocess(code_file)
            
            # Parse the results
            output, error, visualizations, tables = self._parse_results(execution_dir)
            
            # Create result object
            execution_result = CodeExecutionResult(
                output=output,
                error=error,
                visualizations=visualizations,
                tables=tables,
                execution_time=time.time() - start_time
            )
            
            return execution_result
        
        except Exception as e:
            logger.error(f"Error executing code: {str(e)}")
            return CodeExecutionResult(
                output=None,
                error=str(e),
                visualizations=None,
                tables=None,
                execution_time=time.time() - start_time
            )
        
        finally:
            # Clean up the execution directory
            try:
                shutil.rmtree(execution_dir)
            except Exception as e:
                logger.error(f"Error cleaning up execution directory: {str(e)}")
    
    def _prepare_code(self, code: str, file_path: str, execution_dir: str) -> str:
        """
        Prepare the code with safety wrappers and dataset loading.
        """
        # Get the dataset extension
        _, ext = os.path.splitext(file_path)
        
        # Prepare wrapper code
        wrapper = f"""
# Execution wrapper for safety
import os
import sys
import json
import traceback
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder
import io
import base64
from pathlib import Path

# Configure paths
EXECUTION_DIR = {repr(execution_dir)}
RESULT_PATH = os.path.join(EXECUTION_DIR, "result.json")
VISUALIZATION_DIR = os.path.join(EXECUTION_DIR, "visualizations")
os.makedirs(VISUALIZATION_DIR, exist_ok=True)

# Capture output
output_buffer = io.StringIO()
error_buffer = io.StringIO()

# Initialize results
result = {{
    "output": "",
    "error": None,
    "visualizations": [],
    "tables": []
}}

# Load the dataset
try:
    # Use the path provided by the server
    dataset_path = {repr(file_path)}
    if dataset_path.endswith('.csv'):
        df = pd.read_csv(dataset_path)
    elif dataset_path.endswith('.xlsx'):
        df = pd.read_excel(dataset_path)
    else:
        raise ValueError(f"Unsupported file format: {{dataset_path}}")
    
    # Execute user code in a try-except block
    try:
        # Redirect stdout and stderr
        sys.stdout = output_buffer
        sys.stderr = error_buffer
        
        # User code starts here
{self._indent_code(code, 8)}
        # User code ends here
        
        # Process matplotlib figures if any
        fig_num = plt.get_fignums()
        for i, num in enumerate(fig_num):
            fig = plt.figure(num)
            fig_path = os.path.join(VISUALIZATION_DIR, f"matplotlib_{{i}}.png")
            fig.savefig(fig_path)
            with open(fig_path, "rb") as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
            result["visualizations"].append({{
                "type": "matplotlib",
                "format": "png",
                "data": {{
                    "src": f"data:image/png;base64,{{img_data}}",
                    "width": fig.get_figwidth() * fig.get_dpi(),
                    "height": fig.get_figheight() * fig.get_dpi()
                }}
            }})
        
        # Process plotly figures
        def collect_plotly_figures(var):
            if isinstance(var, (go.Figure, px.Figure)):
                fig_path = os.path.join(VISUALIZATION_DIR, f"plotly_{{len(result['visualizations'])}}.json")
                with open(fig_path, "w") as f:
                    f.write(json.dumps(var.to_dict(), cls=PlotlyJSONEncoder))
                result["visualizations"].append({{
                    "type": "plotly",
                    "format": "json",
                    "data": var.to_dict()
                }})
        
        # Check for Plotly figures in locals
        for var_name, var_value in list(locals().items()):
            if var_name != "result":  # Don't process our result dict
                collect_plotly_figures(var_value)
        
        # Add dataframe tables if they exist
        for var_name, var_value in list(locals().items()):
            if var_name != "df" and isinstance(var_value, pd.DataFrame) and len(var_value) > 0:
                result["tables"].append({{
                    "name": var_name,
                    "columns": var_value.columns.tolist(),
                    "data": var_value.head(100).to_dict(orient="records"),
                    "total_rows": len(var_value)
                }})
        
    except Exception as e:
        error_message = traceback.format_exc()
        print(f"Error executing code: {{error_message}}", file=sys.stderr)
    
    finally:
        # Restore stdout and stderr
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
        
        # Save output and error
        result["output"] = output_buffer.getvalue()
        if error_buffer.getvalue():
            result["error"] = error_buffer.getvalue()
        
        # Save result to file
        with open(RESULT_PATH, "w") as f:
            json.dump(result, f)
        
except Exception as e:
    # Handle exceptions outside the user code
    with open(RESULT_PATH, "w") as f:
        json.dump({{
            "output": "",
            "error": f"Error setting up execution environment: {{str(e)}}",
            "visualizations": [],
            "tables": []
        }}, f)
"""
        
        return wrapper
    
    def _indent_code(self, code: str, spaces: int) -> str:
        """
        Indent code by a specified number of spaces.
        """
        indent = " " * spaces
        return indent + code.replace("\n", f"\n{indent}")
    
    async def _execute_in_subprocess(self, code_file: str) -> Dict[str, Any]:
        """
        Execute code in a subprocess for isolation.
        """
        try:
            # Create process
            process = await asyncio.create_subprocess_exec(
                sys.executable, 
                code_file,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Set up timeout
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=self.timeout)
            except asyncio.TimeoutError:
                # Kill the process if it times out
                process.kill()
                return {
                    "output": "",
                    "error": f"Execution timed out after {self.timeout} seconds"
                }
            
            # Check for memory usage (could be improved)
            proc = psutil.Process(process.pid)
            try:
                if proc.memory_info().rss > self.max_memory:
                    process.kill()
                    return {
                        "output": "",
                        "error": f"Execution exceeded memory limit of {self.max_memory / (1024 * 1024)} MB"
                    }
            except psutil.NoSuchProcess:
                # Process already terminated
                pass
            
            return {
                "output": stdout.decode('utf-8'),
                "error": stderr.decode('utf-8') if stderr else None
            }
        
        except Exception as e:
            logger.error(f"Error in subprocess execution: {str(e)}")
            return {
                "output": "",
                "error": str(e)
            }
    
    def _parse_results(self, execution_dir: str) -> tuple:
        """
        Parse the results from the execution.
        """
        result_path = os.path.join(execution_dir, "result.json")
        
        if not os.path.exists(result_path):
            return None, "Execution failed to produce results", None, None
        
        try:
            with open(result_path, "r") as f:
                result = json.load(f)
            
            return (
                result.get("output"),
                result.get("error"),
                result.get("visualizations", []),
                result.get("tables", [])
            )
        
        except Exception as e:
            logger.error(f"Error parsing results: {str(e)}")
            return None, str(e), None, None