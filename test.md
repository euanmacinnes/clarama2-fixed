# Python User Guide for Clarama

## Introduction

This guide focuses on how to write Python code in Clarama tasks to access and work with data, dataframes, and step results. Python is a powerful language for data manipulation and analysis, and Clarama provides a rich set of functions and capabilities to enhance your Python code within tasks.

## Python in Clarama Tasks

In Clarama, Python code can be included in task steps using the `code` type. Here's a basic example:

```yaml
name: python_example
description: A task with Python code
environment: python3
steps:
  - name: python_step
    type: code
    code: |
      # Python code goes here
      import pandas as pd
      
      # Create a simple dataframe
      df = pd.DataFrame({
          'A': [1, 2, 3],
          'B': ['a', 'b', 'c']
      })
      
      # Display the dataframe
      display(df)
```
