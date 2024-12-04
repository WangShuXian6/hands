import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

interface Props {
  images: string[];
  selectedItem?: number;
}

export const Slider = ({ images, selectedItem = 0 }: Props) => {
  return (
    <>
      <Carousel thumbWidth={70} selectedItem={selectedItem} autoPlay={false}>
        {images.map((image, index) => {
          return (
            <div>
              <img src={image} key={image} />
              <p className="legend">Legend {index}</p>
            </div>
          );
        })}
      </Carousel>
    </>
  );
};
