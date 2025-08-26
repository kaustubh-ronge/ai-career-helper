'use client'

import { onboardingSchema } from '@/app/lib/schema';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { updateUser } from '@/actions/user';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OnBoardingForm = ({ industries }) => {

  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();

  const {
    loading: updateLoading,  // renaming loadind, fn, data to updateLoadind, updateUserFn, updateResult 
    fn: updateUserFn,
    data: updateResult
  } = useFetch(updateUser)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(onboardingSchema)
  });

  const onSubmit = async (values) => {
    try {
      const formatedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, "-")}`;


      await updateUserFn({
        ...values,
        industry: formatedIndustry,
      })
    } catch (error) {
      console.error("Onboarding error : ", error)
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading]); // Here [] is dependancy array when we keep it empty then useEffect runs when component is loaded and when we write something in this dependancy array then the useEffect runs on when they change e.g. updateResult

  const watchIndustry = watch("industry");
  return (
    <div className='flex items-center justify-center bg-background pb-2'>
      <Card className='w-full max-w-lg mt-10 mx-2'>
        <CardHeader>
          <CardTitle className='gradient-title text-4xl'>Complete Your Profile</CardTitle>
          <CardDescription>
            Select your industry to get personalized career insights and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}> {/* handleSubmit from zod and react hook form */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger className='w-full' id="industry">
                  <SelectValue placeholder="Select an Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => {
                    return <SelectItem value={ind.id} key={ind.id}>{ind.name}</SelectItem>
                  })}
                </SelectContent>
              </Select>
              {errors.industry && ( // errors are from zod useForm react hook form
                <p className='text-sm text-red-500'>
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialisation</Label>
                <Select
                  onValueChange={(value) => setValue("subIndustry", value)}
                >
                  <SelectTrigger className='w-full' id="subIndustry">
                    <SelectValue placeholder="Select an Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry?.subIndustries.map((ind) => {
                      return (
                        <SelectItem value={ind} key={ind}>
                          {ind}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {errors.subIndustry && ( // errors are from zod useForm react hook form
                  <p className='text-sm text-red-500'>
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")} // register from react hook form and zod
              />
              {errors.experience && ( // errors are from zod useForm react hook form
                <p className='text-sm text-red-500'>
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")} // register from react hook form and zod
              />
              <p className='text-sm text-muted-foreground'>
                Seperate multiple skills with commas
              </p>
              {errors.skills && ( // errors are from zod useForm react hook form
                <p className='text-sm text-red-500'>
                  {errors.skills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                className='h-32'
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("bio")} // register from react hook form and zod
              />
              {errors.bio && ( // errors are from zod useForm react hook form
                <p className='text-sm text-red-500'>
                  {errors.bio.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving ...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnBoardingForm
