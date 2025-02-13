// src/components/UploadFile.jsx
import React from "react";
import { Button, Input } from "@material-tailwind/react";

export default function UploadFile() {
  return (
    <section className="bg-gray-100 py-16 px-4 md:px-0">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-800">Upload Your Files</h2>

        {/* File Upload Form */}
        <div className="mt-6">
          <div className="mb-4">
            <label htmlFor="fileUpload" className="block text-gray-700 font-semibold">Upload File</label>
            <Input
              id="fileUpload"
              type="file"
              className="mt-2 w-full"
            />
          </div>

          <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white">
            Submit
          </Button>
        </div>
      </div>
    </section>
  );
}
