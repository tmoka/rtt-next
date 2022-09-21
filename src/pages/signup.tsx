import axios from "axios";
import router from "next/router";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Fetcher } from "swr";

const SignUp = (): JSX.Element => {

  type UserSignUpType = {
    name: string,
    kana: string,
    email: string,
    password: string,
    confirmPassword: string,
  }

  const { control, handleSubmit } = useForm<UserSignUpType>();

  const onSubmit = (data: UserSignUpType) => {
    if (data.password !== data.confirmPassword) {
      console.error("パスワードが一致しません");
      return;
    }
    axios.post("/api/signup", data).then((res) => {
      console.log(res);
    }).catch((err) => console.error(err));
    alert(JSON.stringify(data));
    router.push("/")
  };

  return <div>
    <form onSubmit={handleSubmit(onSubmit)} >
      <section>
        <label>Email</label>
        <Controller
          render={({ field }) => <input {...field} type="email" />}
          name="email"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>氏名</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="name"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>フリガナ</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="kana"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>パスワード</label>
        <Controller
          render={({ field }) => <input {...field} type="password" />}
          name="password"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>確認用パスワード</label>
        <Controller
          render={({ field }) => <input {...field} type="password" />}
          name="confirmPassword"
          control={control}
          defaultValue=""
        />
      </section>
      <button type="submit">
        アカウント登録
      </button>
    </form>
  </div>
};

export default SignUp;