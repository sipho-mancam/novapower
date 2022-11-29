"""
This is the systems entry point...
where the input and output to and from the system will happen.
"""

from core.core import Core


def get_sizing_tool(data: dict)->Core:
    return Core(data)


