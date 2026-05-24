import sys
from PIL import Image
import numpy as np

def fix_logo():
    raw_path = r"C:\Users\empty\.gemini\antigravity\brain\c860bd03-3373-4e48-bd5f-c1c92132a12c\vibecode_town_final_logo_1_1779566964179.png"
    out_path = r"F:\Aisaak\Projects\vibecode-town\public\logo-final.png"
    
    img = Image.open(raw_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data.T
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    bg_mask = luminance > 210
    data[..., 3][bg_mask.T] = 0
    
    # Remove noise by thresholding alpha
    # Any pixel that isn't completely solid or close to it gets blown away
    # data[..., 3][data[..., 3] < 200] = 0
    
    img_transparent = Image.fromarray(data)
    
    # Hardcode the exact coordinates that we found were the real building and text
    box = (73, 108, 921, 846)
    img_cropped = img_transparent.crop(box)
    
    # Re-evaluate bbox just to be absolutely sure we strip any remaining invisible 1px borders
    bbox = img_cropped.getbbox()
    if bbox:
        img_cropped = img_cropped.crop(bbox)
        
    img_cropped.save(out_path)
    
    # Also save to review
    review_path = r"C:\Users\empty\.gemini\antigravity\brain\c860bd03-3373-4e48-bd5f-c1c92132a12c\logo-final-for-review.png"
    img_cropped.save(review_path)
    
    print(f"Final size: {img_cropped.size}")

if __name__ == "__main__":
    fix_logo()
