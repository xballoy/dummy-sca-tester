import yaml
from unidecode import unidecode


def load_config(raw):
    return yaml.load(raw, Loader=yaml.FullLoader)


def normalize(value):
    return unidecode(value)
