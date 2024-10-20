interface ImageProps {
  url: string;
  width?: number;
  height?: number;
}

const transformImage = ({ url = "", width = 180, height }: ImageProps) => {
  let newUrl = url;
  if (!height) {
    newUrl = url.replace("upload/", `upload/w_${width},dpr_auto/`);
  } else {
    newUrl = url.replace("upload/", `upload/w_${width},h_${height},dpr_auto/`);
  }
  return newUrl;
};

export { transformImage };
