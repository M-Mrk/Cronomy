import subprocess
from typing import Optional

COMMAND_ARGUMENT_POS = 5 # Index of the command in the crontab
LINE_ARGUMENT_POS = 6
ERROR_ARGUMRNT_POS = 7

def get_crontab(root: bool=False):
    """
    Returns the raw string of the crontab file
    """
    command = ['crontab', '-l']
    if root:
        command.insert(0, 'sudo') # Add sudo to the front of the command
    result = subprocess.run(command,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if b'no crontab for' in result.stderr:
        return ""  # No crontab exists
    elif result.returncode != 0:
        raise RuntimeError(result.stderr.decode())
    return result.stdout.decode()

class Crontab_entry():
    def __init__(self, minute: str, hour: str, day_of_month: str, month: str, day_of_week: str, command: str, line: int, error: Optional[str]):
        self.minute = minute
        self.hour = hour
        self.day_of_month = day_of_month
        self.month = month
        self.day_of_week = day_of_week
        self.command = command
        self.line = line
        self.error = error if error else False

CHARS_TO_SKIP = '#'
CRONTAB_ARGUMENTS = ["minute", "hour", "day_of_month", "month", "day_of_week", "command"]

def str_to_crontab_obj(raw_entries: str):
    """
    Converts all entries in the given raw string into crontab obj and returns them in a list
    """
    output_entries = []
    for line_number, line in enumerate(raw_entries.splitlines()):
        stripped_line = line.strip()
        if stripped_line == "" or stripped_line[0] in CHARS_TO_SKIP: # Skip line if it is empty or starts with a char of CHARS_TO_SKIP
            continue
        
        entry_arguments = []
        error = ""
        for index, argument in enumerate(CRONTAB_ARGUMENTS):
            try:
                split_line = stripped_line.split()
                if index == COMMAND_ARGUMENT_POS and len(split_line) > COMMAND_ARGUMENT_POS: # On command argument and there are still elements left -> command has spaces
                    command = split_line[index]
                    for x in range((COMMAND_ARGUMENT_POS+1), (len(split_line))): # Add all arguments from 4 to end
                        command += f" {split_line[x]}"
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
            line=(line_number+1),
            error=error if error else None
        )
        output_entries.append(new_crontab_entry)

    return output_entries

def get_crontab_entries(root: bool=False) -> list[Crontab_entry]:
    """
    Returns all crontab entries as a list of Crontab_entry objs. 
    """
    raw_entries = get_crontab(root=root)
    return str_to_crontab_obj(raw_entries=raw_entries)

def print_entries(entries: list[Crontab_entry]):
    """
    Prints all Crontab_entry obj in the given List
    """
    for index, entry in enumerate(entries):
        print(f"  {index}:")
        for key, value in entry.__dict__.items(): # Turn into a dict and print every key and its value
            print(f"    {key}: {value}")
        print("\n")

CRONTAB_OBJ_ARGUMENTS = 6
def crontab_obj_to_str(crontab_objs: list[Crontab_entry]):
    output = ""
    for obj in crontab_objs:
        if obj.error:
            raise Exception("Crontab obj had an error and could not be parsed to string.")
    for object in crontab_objs:
        object_dict = object.__dict__
        for index, (key, value) in enumerate(object_dict.items()):
            if index >= LINE_ARGUMENT_POS: # stop iterating after getting all important attributes
                break
            output += f"{value} "
        output += "\n"
    return output

def write_crontab(crontab_objs: Optional[list[Crontab_entry]]=None, crontab_string: Optional[str]=None, root: bool=False):
    """
    Replaces the current crontab with the given string or the list of crontab objs
    """
    command = ["crontab", "-"]
    if root:
        command.insert(0, "sudo")

    if not crontab_objs and not crontab_string:
        raise ValueError("Could not write crontab, as there was neither a crontab obj nor a crontab string.")

    if crontab_objs:
        crontab = crontab_obj_to_str(crontab_objs=crontab_objs)
    else:
        crontab = crontab_string

    subprocess.run(command, input=crontab, text=True)

def append_crontab_entry(entry: Crontab_entry, root: bool=False):
    """
    Appends the given crontab obj
    """
    crontab = get_crontab(root=root)
    new_entry = crontab_obj_to_str([entry])
    crontab += f"\n{new_entry}"
    write_crontab(crontab_string=crontab, root=root)

def replace_crontab_entry(new_entry: Crontab_entry, root: bool=False):
    """
    Will replace the crontab at the given line number of new_entry.line with the new_entry.
    """
    crontab = get_crontab(root=root)
    new_crontab = ""
    for index, line in enumerate(crontab.splitlines()):
        if new_entry.line == (index+1):
            new_crontab += crontab_obj_to_str([new_entry])
        else:
            new_crontab += line
            new_crontab += "\n"
    
    write_crontab(crontab_string=new_crontab, root=root)

if __name__ == "__main__":
    print("User:")
    print_entries(get_crontab_entries(root=False))

    print("Root:")
    print_entries(get_crontab_entries(root=True))