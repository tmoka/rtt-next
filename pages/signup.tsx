import React from "react";
import { useForm, Controller } from "react-hook-form";

const SignUp = (): JSX.Element => {

  type UserSignUpType = {
    name: string,
    email: string,
    password: string,
  }

  const { control, handleSubmit } = useForm<UserSignUpType>();

  const onSubmit = (data: UserSignUpType) => {
    alert(JSON.stringify(data));
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
        <label>メールアドレス</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="email"
          control={control}
          defaultValue=""
        />
      </section>
      <section>
        <label>パスワード</label>
        <Controller
          render={({ field }) => <input {...field} />}
          name="password"
          control={control}
          defaultValue=""
        />
      </section>
      <button type="submit">
        Send
      </button>
    </form>
  </div>
};

export default SignUp