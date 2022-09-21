import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import useSWR from "swr";

const UserEdit: NextPage = () => {
  type UserEditType = {
    name: string,
    kana: string,
    email: string,
  }

  const { control, handleSubmit } = useForm<UserEditType>();
  const router = useRouter();
  const { id } = router.query;

  const onSubmit = (data: UserEditType) => {
    axios.put("/api/users/" + id, data).then((res) => {
      alert(JSON.stringify(res));
    }).catch((err) => console.error(err));
    alert(JSON.stringify(data));
    router.push("/users")
  };

  return <div>
    <form onSubmit={handleSubmit(onSubmit)} >
      <section>
        <label>名前</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="name"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>ふりがな</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="kana"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>メールアドレス</label>
        <Controller
          render={({ field }) => <input {...field} type="email" />}
          name="email"
          control={control}
          defaultValue=""
        />
      </section>
      <button type="submit">
        編集
      </button>
    </form>
  </div>

}

export default UserEdit;