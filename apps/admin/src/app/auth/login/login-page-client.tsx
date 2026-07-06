'use client';

import { login } from '@/apis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { createLogin } from '@/libs/auth';
import { FormikValues, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';

export default function LoginPageClient() {
  const router = useRouter();

  const formik = useFormik({
    enableReinitialize: false,
    initialValues: {
      email: 'super.admin@example.com',
      password: 'password',
      checked: false,
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Please enter a valid email!')
        .required('Please enter a valid email!'),
      password: Yup.string().required('Please enter a valid password!'),
    }),
    onSubmit: (values: FormikValues, { setSubmitting }) => {
      setSubmitting(true);

      login({ email: values.email, password: values.password })
        .then(responseData => {
          if (!responseData || !responseData.data) throw { message: 'Server not working!' };

          if (responseData.statusCode !== 200) throw { message: responseData.message };

          const success = createLogin(
            responseData.data.user,
            responseData.data.access_type,
            responseData.data.access_token,
          );

          if (success) {
            router.push('/');
          }
        })
        .catch(error => {
          console.error('error', error);
          // You can add toast notification here if needed
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl sm:rounded-[56px] bg-gradient-to-b from-primary/10 to-transparent p-1">
          <Card className="rounded-xl sm:rounded-[53px]">
            <CardHeader className="text-center px-4 pt-6 sm:px-6 sm:pt-8">
              <CardTitle className="text-2xl sm:text-3xl mb-2 sm:mb-3">
                Welcome, Example Admin!
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-6 sm:pb-8">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address..."
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    autoComplete="email"
                    className={cn(formik.errors.email && 'border-destructive')}
                  />
                  {formik.errors.email && (
                    <p className="text-sm text-destructive">{formik.errors.email.toString()}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password..."
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    className={cn(formik.errors.password && 'border-destructive')}
                  />
                  {formik.errors.password && (
                    <p className="text-sm text-destructive">{formik.errors.password.toString()}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={formik.values.checked}
                      onCheckedChange={checked => formik.setFieldValue('checked', checked)}
                    />
                    <Label htmlFor="remember-me" className="cursor-pointer text-sm">
                      Remember Me
                    </Label>
                  </div>
                  <a
                    className="text-sm text-primary hover:underline cursor-pointer"
                    onClick={() => {
                      router.push('/v-p/reset-password');
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
