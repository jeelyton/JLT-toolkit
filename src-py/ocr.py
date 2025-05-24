import sys

def rapidocr2text(img_path: str):
    from rapidocr import RapidOCR

    engine = RapidOCR(params={
        # "Global.lang_det": "th_server",
        # "Global.lang_rec": "th_server",
        # "Global.lang_det": "ml_server",
        # "Global.language_list": ["th"]
    })
    result = engine(img_path)
    return "\n".join(result.txts)

if __name__ == "__main__":
    print(rapidocr2text(sys.argv[1]))