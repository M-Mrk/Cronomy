import os

def get_filepath(root: bool):
    filename = "sudo_fake_crontab.txt" if root else "fake_crontab.txt"
    return os.path.join(os.path.dirname(__file__), filename)

def get_fake_crontab(root: bool):
    with open(file=get_filepath(root), mode='r', encoding="UTF-8") as file:
        return file.read()
    
def write_fake_crontab(input: str, root: bool):
    with open(file=get_filepath(root), mode='w', encoding="UTF-8") as file:
        file.write(input)
        return