import os
from vecem import download_dataset

def test_download():
    download_dataset("myfile")
    assert os.path.exists("downloads/myfile.zip"), "Download failed!"

test_download()
