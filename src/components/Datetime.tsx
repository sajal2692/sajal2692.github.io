import { formatPostDate } from "@utils/formatPostDate";

interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}

interface Props extends DatetimesProps {
  size?: "sm" | "lg";
  className?: string;
}

/**
 * The post-list metadata line. Monospace, tabular, muted — the same voice as the
 * article kicker and the tag chips, so a page never shows three different
 * treatments of the same fact. The calendar icon and italics it used to carry
 * were the third.
 */
export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
}: Props) {
  return (
    <div
      className={`metadata flex items-center ${
        size === "sm" ? "text-[0.8125rem]" : "text-sm"
      } ${className}`}
    >
      {modDatetime ? (
        <span>Updated&nbsp;</span>
      ) : (
        <span className="sr-only">Published:&nbsp;</span>
      )}
      <FormattedDatetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
    </div>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(modDatetime ? modDatetime : pubDatetime);

  return (
    <time dateTime={myDatetime.toISOString()}>
      {formatPostDate(myDatetime)}
    </time>
  );
};
