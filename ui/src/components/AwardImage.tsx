interface AwardImageProps {
  label: string;
  url: string;
}

/** Show AwardImage */
export default function AwardImage(props: AwardImageProps) {
  const { label, url } = props;
  return (
    <img
      width={125}
      height={125}
      style={{ objectFit: "cover" }}
      src={process.env.PUBLIC_URL + url}
      alt={label}
    />
  );
}
