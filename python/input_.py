def ask(prompt, possible):
    choice = input(prompt)
    while not choice in possible:
        print("…I did not catch that :/")
        choice = input(prompt)
    return choice


def ask_mode(config):
    if config['askForMode']:
        return ask(
            "Would you like to use the scanner mode ? (SCANNER / MANUAL)",
            ["SCANNER", "MANUAL"])
    else:
        return config['defaultMode']


def ask_material(config, materials):
    if config['askForMaterial']:
        prompt = "What type of material is being scanned ? ("
        acceptedAns = []
        for mat in materials:
            item = materials[mat]
            prompt = item['name'] + ': ' + item['code'] + ", "
            acceptedAns.append(item['code'])
        prompt = prompt[:-2] +  ") "
        return ask(prompt, acceptedAns)
    else:
        return config['defaultMaterial']
