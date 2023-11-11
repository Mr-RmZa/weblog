import moment from "jalali-moment";

export const formatDate = (date: Date) => {
  return moment(date).locale("fa").format("MMM D YYYY");
};
