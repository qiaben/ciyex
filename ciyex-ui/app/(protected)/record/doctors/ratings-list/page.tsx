import { getDoctorRatings } from "@/utils/services/rating";
import { RatingsListClient } from "./ratings-list-client";

export default async function RatingsListPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const ratings = await getDoctorRatings(params.id);

  return <RatingsListClient ratings={ratings} />;
} 