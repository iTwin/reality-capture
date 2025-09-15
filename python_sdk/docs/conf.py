# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

import reality_capture

project = 'Reality Capture'
copyright = '2025, Bentley Systems'
author = 'Bentley Systems'
release = reality_capture.__version__

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['myst_parser', 'sphinx.ext.autodoc', 'sphinxcontrib.autodoc_pydantic']

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store',
                    'specifications/change_detection.rst', 'specifications/eval_*.rst',
                    'specifications/segmentation*.rst', 'specifications/training*.rst',
                    'specifications/objects2d.rst', 'specifications/point_cloud_conversion.rst']

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# Pydantic
autodoc_pydantic_settings_show_json = True
autodoc_pydantic_field_show_alias = False
autodoc_pydantic_model_show_field_summary = False
autodoc_pydantic_model_summary_list_order = 'bysource'

# Autodoc
autodoc_class_signature = 'separated'
autodoc_member_order = 'bysource'

# ReadTheDocsLink
html_context = {
    "display_github": True,  # Integrate GitHub
    "github_user": "iTwin",  # Username
    "github_repo": "reality-capture",  # Repo name
    "github_version": "feature/2.0.0",  # Version
    "conf_py_path": "/python_sdk/docs/",  # Path in the checkout to the docs root
    "current_version": release,
    "versions": ["latest", "2.0.0"],
}
