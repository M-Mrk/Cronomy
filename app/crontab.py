import subprocess
from typing import Optional

def get_crontab(root: bool):
    command = ['crontab', '-l']
    if root:
        command.insert(0, 'sudo')
    result = subprocess.run(command,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if b'no crontab for' in result.stderr:
        return ""  # No crontab exists
    elif result.returncode != 0:
        raise RuntimeError(result.stderr.decode())
    return result.stdout.decode()

class Crontab_entry():
    def __init__(self, minute: str, hour: str, day_of_month: str, month: str, day_of_week: str, command: str, root: bool, line: int, error: Optional[str]):
        self.minute = minute
        self.hour = hour
        self.day_of_month = day_of_month
        self.month = month
        self.day_of_week = day_of_week
        self.command = command
        self.line = line
        self.root = root
        self.error = error if error else False

CHARS_TO_SKIP = '#'
CRONTAB_ARGUMENTS = ["minute", "hour", "day_of_month", "month", "day_of_week", "command"]
COMMAND_ARGUMENT_POS = 5
def convert_to_crontab_obj(raw_entries: str, root: bool):
    output_entries = []
    for line_number, line in enumerate(raw_entries.splitlines()):
        stripped_line = line.strip()
        if stripped_line == "" or stripped_line[0] in CHARS_TO_SKIP:
            print(f"{stripped_line}, was skipped")
            continue
        
        entry_arguments = []
        error = ""
        for index, argument in enumerate(CRONTAB_ARGUMENTS):
            try:
                split_line = stripped_line.split()
                if index == COMMAND_ARGUMENT_POS and len(split_line) > COMMAND_ARGUMENT_POS: # On command argument and there are still elements left -> command has spaces
                    command = ""
                    for x in range(COMMAND_ARGUMENT_POS, (len(split_line))): # Add all arguments from 4 to end
                        command += split_line[x]
                    entry_arguments.append(command)
                else:
                    entry_arguments.append(split_line[index])

            except ValueError:
                entry_arguments.append("")
                error += f"{argument} is missing from entry. "


        new_crontab_entry = Crontab_entry(
            minute=entry_arguments[0],
            hour=entry_arguments[1],
            day_of_month=entry_arguments[2],
            month=entry_arguments[3],
            day_of_week=entry_arguments[4],
            command=entry_arguments[5],
            root=root,
            line=line_number,
            error=error if error else None
        )
        output_entries.append(new_crontab_entry)

    return output_entries

def get_crontab_entries(root: bool):
    raw_entries = get_crontab(root=root)
    return convert_to_crontab_obj(raw_entries=raw_entries, root=root)

def print_entries(entries: list[Crontab_entry]):
    for index, entry in enumerate(entries):
        print(f"  {index}:")
        for key, value in entry.__dict__.items():
            print(f"    {key}: {value}")
        print("\n")

def write_crontab(crontab: str):
    pass

def append_entry(root: bool):
    pass

if __name__ == "__main__":
    print("User:")
    print_entries(get_crontab_entries(root=False))
    
    print("Root:")
    print_entries(get_crontab_entries(root=True))