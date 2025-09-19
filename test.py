from app.crontab import get_crontab_entries
from pprint import pprint
for entry in get_crontab_entries():
    pprint(vars(entry) if hasattr(entry, '__dict__') else entry)

for entry in get_crontab_entries(True):
    pprint(vars(entry) if hasattr(entry, '__dict__') else entry)