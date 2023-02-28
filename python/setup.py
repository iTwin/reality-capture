from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='reality_apis',
    version='1.0.0',
    description='This package contains a SDK for Context Capture and Reality Data Analysis iTwin APIs as well as Reality Data API utils. It provides classes, functions and examples to upload local data to ContextShare, run Context Capture/Reality Data Analysis jobs and download the results.',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='https://github.com/iTwin/reality-capture/tree/main/python',
    author='Bentley Systems',
    author_email='ariana.carnielli@bentley.com',
    license='MIT',
    classifiers = [
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: MIT License",
        "Operating System :: Microsoft :: Windows",
    ],
    project_urls = {
        "Homepage": "https://https://github.com/iTwin/reality-apis-samples/tree/main/python",
        "RDAS Api reference": "https://developer.bentley.com/apis/realitydataanalysis/",
        "CCS Api reference": "https://developer.bentley.com/apis/contextcapture/",
        "RDS Api reference": "https://developer.bentley.com/apis/reality-data/"
    },
    packages =
    find_packages(
        exclude=["/examples"],
        include=["reality_apis", "reality_apis.CCS", "reality_apis.RDAS", "reality_apis.DataTransfer", "token_factory"]
    ),
    install_requires= [
        "bottle >= 0.12",
        "oauthlib >= 3.2",
        "requests-oauthlib >= 1.3.1",
        "azure-storage-blob >= 12.9",
    ]
)
