import os
import re
import json
import locale
import itertools
from datetime import datetime, timedelta, time


def write_json(obj, path="", write_type='w'):
    with open(path, write_type) as f:
        json.dump(obj, f)
    f.close()


def read_json(path=""):
    if os.path.isfile(path):
        obj = []
        with open(path) as f:
            obj.append(json.load(f))
        f.close()
        return obj[0]
    else:
        write_json({'symbols': []}, path)
        return {}


def minutes_since_930():
    now = datetime.now()
    return divmod((now - now.replace(hour=9, minute=30, second=0, microsecond=0)).total_seconds(), 60)[0]


def fdt_to_abbr(fdatetime=""):
    # 2022-05-31T09:30:00
    m, d = fdatetime[5:7], int(fdatetime[8:10])
    return f"{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][int(m) - 1]} {d}"


def make_dt_tooltip(fdatetime="", freq="min"):
    freq = freq if freq in ['1D', 'min', 'sec'] else "min"
    if freq == 'min':
        hhmmss = fdatetime[11:16]
    elif freq == 'sec':
        hhmmss = fdatetime[11:19]
    else:
        hhmmss = fdatetime[0:4]  # year
    if freq in ['min', 'sec']:
        ampm = 'pm' if float(fdatetime[11:16].replace(":", ".")) > 12.0 else 'am'
    else:
        ampm = ''
    return f"{fdt_to_abbr(fdatetime)}, {hhmmss}{ampm}"


def tree_traverse(tree, key):
    if key in tree:
        return tree[key]
    for v in filter(dict.__instancecheck__, tree.values()):
        if (found := tree_traverse(v, key)) is not None:
            return found


def format_currency(n):
    locale.setlocale(locale.LC_ALL, '')
    return locale.currency(n, grouping=True)


def list_of_datetimes(days, day_only=False):
    start, now = datetime.today() - timedelta(days=days), datetime.now()
    delta = now - start
    return [dt.strftime("%Y-%m-%dT00:00:00" if day_only else "%Y-%m-%dT%H:%M:%S") for dt in
            [start + timedelta(days=i) for i in range(delta.days + 1)]]


def group_list_of_dicts(dict_array, key=""):
    return [[
        grp for grp in group
    ] for key, group in itertools.groupby(sorted(dict_array, key=lambda x: x[key]), key=lambda x: x[key])]


def after_hours():
    now = datetime.now().time()
    return True if now >= time(hour=20) or now < time(hour=7) else False


def is_weekend():
    return True if datetime.today().weekday() in [5, 6] else False


def count_instances(dicts=[], key="", match=""):
    return sum([1 if d[key] == match else 0 for d in dicts])


class Log:
    def __init__(self, file='assets/bin/Tradex.log', console=True, debug_console=False):
        self.file_path = file
        self.console = console
        self.debug_console = debug_console

    def empty_log_file(self):
        with open(self.file_path, "w") as f:
            f.write("")
        f.close()

    def write_to_file(self, message, write_type='a'):
        with open(self.file_path, write_type) as f:
            f.write(f"{message}\n")
        f.close()

    def format(self, level, message):
        dt = datetime.now().strftime('%d-%b-%y %H:%M:%S')
        return f"[{dt}][{level}] - {message}"

    def debug(self, message):
        message = self.format("DEBUG", message)
        self.write_to_file(message)
        print(message) if self.console and self.debug_console else ""

    def info(self, message):
        message = self.format("INFO", message)
        self.write_to_file(message)
        print(message) if self.console else ""

    def error(self, message):
        message = self.format("ERROR", message)
        self.write_to_file(message)
        print(message) if self.console else ""


def remove_duplicates(in_list):
    out_list = []
    out_list_app = out_list.append
    for item in in_list:
        if item not in out_list:
            out_list_app(item)
    return out_list


def split_by_capital_letter(string):
    arr = [i.capitalize() for i in re.findall('[A-Z][^A-Z]*', string[0].upper()+string[1:len(string)])]
    if arr:
        return ' '.join(arr)
    else:
        return string.capitalize()


def split_list(lst, size):
    return [lst[i:i+size] for i in range(0, len(lst), size)]


def calculate_percentage_increase(start_value, end_value):
    increase = end_value - start_value
    return round((increase / start_value) * 100, 2)


def clear_console():
    # Use platform-specific command to clear the console screen
    os.system('cls' if os.name == 'nt' else 'clear')