"use client"

import * as React from "react"
import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";

// Importing API End Points
import api from "@/services/api"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AcceptInviteFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormValues = {
    password: string;
    repeat_password: string;
    first_name: string;
    last_name: string;
};

export function AcceptInviteForm({ className, ...props }: AcceptInviteFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const router = useRouter()
  const { token } = router.query;
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.repeat_password) {
      console.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        token,
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          password: data.password,
        },
      };
      console.log("Payload: ", payload);

      const response = await api.invites.accept(payload);

      console.log("Invite accepted successfully:", response);
      router.push(`/dashboard/search`).then(

      )

    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <div className="grid gap-5">
            <div className="flex flex-row gap-5">
                <Input
                    id="email"
                    placeholder="First Name"
                    type="first_name"
                    autoCapitalize="none"
                    autoComplete="first_name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...register("first_name", { required: true })}
                />
                {errors.first_name && <p>First name is required.</p>}

                <Input
                    id="email"
                    placeholder="Last Name"
                    type="last_name"
                    autoCapitalize="none"
                    autoComplete="last_name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...register("last_name", { required: true })}
                />
            </div>
            {errors.last_name && <p>Last name is required.</p>}

            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              {...register("password", { required: true })}
            />
            {errors.password && <p>Password is required.</p>}

            <Input
              id="repeatPassword"
              placeholder="Repeat Password"
              type="repeat_password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              {...register("repeat_password", { required: true })}
            />
            {errors.repeat_password && <p>You must repeat your password.</p>}
          </div>
          <Button disabled={isLoading} type="submit">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  )
}
