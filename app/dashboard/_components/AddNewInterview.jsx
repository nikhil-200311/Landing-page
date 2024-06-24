"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { mockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDialog, setDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonresponse] = useState();
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobExperience);

    const IputPrompt =
      "Job position: " +
      jobPosition +
      ", Job Description: " +
      jobDesc +
      " Years of Experience : " +
      jobExperience +
      " , Depends on Job Position, Job Description & Years of Experience give us 5 Interview question along with Answer in JSON format, Give us question and answer field on JSON";

    const result = await chatSession.sendMessage(IputPrompt);
    const MockJsonResponse = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(JSON.parse(MockJsonResponse));
    setJsonresponse(MockJsonResponse);
    setLoading(false);
    if (MockJsonResponse) {
      const resp = await db
        .insert(mockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResponse,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          jobPosition: jobPosition,
          createdBy: user?.primaryEmailAddress.emailAddress,
          createdAt: moment().format("DD-MM-yyyy"),
        })
        .returning({ mockId: mockInterview.mockId });
        console.log("inserted id", resp);
        if(resp){
          setDialog(false)
          router.push('/dashboard/interview/'+resp[0]?.mockId)
        }

    }
    else{
      console.log('ERROR')
    }
    setLoading(false)
  };
  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setDialog(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about Jab you are Interviewing
            </DialogTitle>
            <form onSubmit={onSubmit}>
              <DialogDescription>
                <div>
                  <h2>
                    Add details about your position/role, Job Description and
                    years of experience
                  </h2>
                  <div className="mt-7 my-3">
                    <label>Job Role/ Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    ></Input>
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech Stack</label>
                    <Textarea
                      placeholder="Ex. React, Angular, Django"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    ></Textarea>
                  </div>
                  <div className="my-3">
                    <label>Years of Experience</label>
                    <Input
                      placeholder="Ex. 3"
                      type="number"
                      max="50"
                      required
                      onChange={(event) => setJobExperience(event.target.value)}
                    ></Input>
                  </div>
                </div>
                <div className=" justify-between flex pl-5 pr-5 pt-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disable={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Generating From AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </DialogDescription>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
