import { industries } from '@/data/industries'
import React from 'react'
import OnBoardingForm from './_components/onboarding-form'
import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation'

const OnBoardingPage = async () => {
    // check if user is already onboarded then go to dashboard 
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
        redirect("/dashboard")
    }
    return (
        <main>
            <OnBoardingForm industries={industries} /> {/* it will be client component */}
        </main>
    )
}

export default OnBoardingPage
