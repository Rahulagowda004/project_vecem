from setuptools import setup, find_packages

setup(
    name="vecem",
    version="0.2.0",  # updated version
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "azure-storage-blob>=12.0.0",
        "azure-core>=1.26.0"
    ],
    author="vecem",
    author_email="vectorembeddings@example.com",
    description="A library for downloading datasets from Vecem",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
)
