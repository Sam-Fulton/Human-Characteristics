import os
import imageio
import numpy as np
from skimage import measure
from pathlib import Path

def convert_directory_to_svg(input_directory, output_directory):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    for filename in os.listdir(input_directory):
        if filename.endswith(".png"):
            input_path = Path(input_directory) / filename 
            output_path = Path(output_directory) / f"{os.path.splitext(filename)[0]}.svg"
            
            image = imageio.imread(input_path)

            image_gray = np.mean(image, axis=-1)

            contours = measure.find_contours(image_gray, 0.5)

            with open(output_path, 'w') as svg_file:
                svg_file.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}">\n'.format(image.shape[1], image.shape[0]))
                svg_file.write('<path d="')
                for contour in contours:
                    svg_file.write('M ')
                    svg_file.write(' L '.join(['{},{}'.format(coord[1], coord[0]) for coord in contour]))
                    svg_file.write(' Z ')
                svg_file.write('" />\n</svg>')

if __name__ == "__main__":
    input_directory = "./resources/images"
    output_directory = "./resources/images_svg"

    convert_directory_to_svg(input_directory, output_directory)
