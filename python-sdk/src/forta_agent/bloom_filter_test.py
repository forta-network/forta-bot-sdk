from . import BloomFilter


def test_alert_0xb680bc4e826ee6419f738a7cd76838126a1cfd85ef4607cb0ae2b75b0a5c70af():
    k = '0xa'  # 10
    m = '0xd33'  # 3379
    content = "AAAAAAAADTMAAAAAAAAACgAAAAAAAA0zoCntpyGtcm49UqMM9AWNWqEnAxF/UO3IbAPDWRKTJq+wpI051Z+uHn7exEpOzxdllSK+ICU9OfhN+FXsLpC2HkzRYDrOJ0Zp9DG73mRPvwRTcyFHwSOwlCtNoE9pgSk8jXe2S7uTanRQrS6WnP71vagcoXHydeiJfyVIxHIEt5IydneVsPBO0ko/iypb5EtAx57IiOWgmIWqngc+mao8bY9rxe42mv4ZnG/JGRqZyxdgIWSLrpCwkqOEVyYxuHFzoH67YujJUuPsl8GY0sFMJdpuySJlEgzIELFNcsJSA9YLLgAJ7flterIjUIgTad3rgR2kNu1OQksso0NlQY2OhguEoNDrtJcWTRwYudO69Q5Kp1mcg3ax+n0iP4Q8tgjrJhD0EnLujlYQPH1Gdr8v1zJVZ2PhLVFDnXjQGoZ6Lmqi/fjOTpvHwSks+jeHuCzWF1X9Lvm7/LPWDd2XX/jmyp9df2NiA/Jb3FhZf3akolcMIo5hnXnnyn1LupGbILiIz24NwzMl3w43xOe1bDEvRKiD+s3qNhrxbmWM9V03NMYABHfM2p7W1Q=="

    b = BloomFilter({'k': k, 'm': m, 'bitset': content})

    assert b.has("0x030cb0fd022b0a66d2d6e39d0691cce86d4188b8") == True
    assert b.has("0x1727b5a84fee033c3065473cc91c23e8607eef6b") == True
    assert b.has("0x1f11417c24fecc07154ce96db1b7b6af11c3af3f") == True
    assert b.has("a") == False
    assert b.has("b") == False
    assert b.has("c") == False


def test_alert_0xd7387cfe3ad5e051ba195ab0386ae33b2359ca403d650df5d05fc6dc596db149():
    k = 11
    m = 15
    content = "AAAAAAAAAA8AAAAAAAAACwAAAAAAAAAPAAAAAAAANtI="

    b = BloomFilter({'k': k, 'm': m, 'bitset': content})

    assert b.has("0x68f180fcce6836688e9084f035309e29bf0a2095") == True
    assert b.has("a") == False
    assert b.has("b") == False
    assert b.has("c") == False
