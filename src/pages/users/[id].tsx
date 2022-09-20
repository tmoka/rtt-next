import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

const User = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const session = useSession();

  if (session.status == "unauthenticated") {
    router.push("/api/auth/signin");
  }

  const fetcher = (url: string) => axios.get(url).then(res => res.data)
  const { data, error } = useSWR('/api/users/' + id, fetcher)
  if (!id) return <>Loading</>
  if (!data) return <div>Loading</div>;
  if (error) return <div>エラーが発生しました</div>


  return <><p>{data.name}</p><p>{data.kana}</p><p>{data.email}</p></>
}

export default User;