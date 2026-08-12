import yaml
from jinja2 import Template


def load_config(raw):
    return yaml.load(raw, Loader=yaml.FullLoader)


def render_greeting(name):
    return Template("hello {{ user }}").render(user=name)
