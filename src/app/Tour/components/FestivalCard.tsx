import Link from "next/link";

type FestivalCardProps = {
  contentId: string;
  image: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
};

const FestivalCard = ({
  contentId,
  image,
  title,
  startDate,
  endDate,
  location,
}: FestivalCardProps) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}.${month}.${day}`;
  };

  return (
    <Link href={`/Tour/${contentId}`}>
      <div className="festival-card">
        <div className="image-container">
          {image ? (
            <img src={image} alt={title} className="festival-image" />
          ) : null}
        </div>
        <div className="festival-info">
          <h3 className="festival-title">{title}</h3>
          <p className="festival-date">
            {formatDate(startDate)} ~ {formatDate(endDate)}
          </p>
          <p className="festival-location">{location}</p>
        </div>
      </div>
    </Link>
  );
};

export default FestivalCard;
