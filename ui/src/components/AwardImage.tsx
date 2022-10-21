interface AwardImageProps {
  label: string;
  url: string;
  pixels: number;
}

/** Show AwardImage */
export default function AwardImage(props: AwardImageProps) {
  const { label, url, pixels } = props;
  return (
    <img
      width={pixels}
      height={pixels}
      style={{ objectFit: "cover" }}
      src={process.env.PUBLIC_URL + url}
      alt={label}
    />
  );
}
