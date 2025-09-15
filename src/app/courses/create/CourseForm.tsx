"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CourseForm() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>

      <form action="/api/courses/create" method="post" className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input name="title" placeholder="Course title" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            placeholder="Course description"
            rows={4}
            required
          />
        </div>

        <Button type="submit">Create Course</Button>
      </form>
    </div>
  );
}
