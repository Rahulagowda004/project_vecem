import React from 'react';

const Documentation = () => {
  return (
    <div className="documentation-container text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Documentation</h1>
      <p className="text-lg mb-2">
        Welcome to the documentation page. Here you will find all the information you need to get started with our project.
      </p>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
        <p className="text-md">
          To get started, follow these steps:
        </p>
        <ol className="list-decimal list-inside ml-4">
          <li>Step 1: Clone the repository.</li>
          <li>Step 2: Install dependencies using <code>npm install</code>.</li>
          <li>Step 3: Run the development server using <code>npm start</code>.</li>
        </ol>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">API Documentation</h2>
        <p className="text-md">
          Our API provides the following endpoints:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li><code>GET /api/v1/resource</code>: Fetches a list of resources.</li>
          <li><code>POST /api/v1/resource</code>: Creates a new resource.</li>
          <li><code>PUT /api/v1/resource/:id</code>: Updates an existing resource.</li>
          <li><code>DELETE /api/v1/resource/:id</code>: Deletes a resource.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">FAQ</h2>
        <p className="text-md">
          Frequently Asked Questions:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>Question 1: How do I reset my password?</li>
          <li>Question 2: How do I contact support?</li>
          <li>Question 3: Where can I find the source code?</li>
        </ul>
      </section>
    </div>
  );
};

export default Documentation;