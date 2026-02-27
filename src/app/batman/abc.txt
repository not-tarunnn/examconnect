"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import AutoNotification from "@/components/AutoNotification";
import QuestionEditor from "@/components/admin/QuestionEditor";
import QuestionsList from "@/components/admin/QuestionsList";
import { Question } from "@/types/question";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timestamp } from 'firebase/firestore';
import { AdminQuestion } from '@/lib/adminQuestionService';

export default function AdminBatmanPage() {
  const [activeTab, setActiveTab] = useState('add');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  const adminEditingQuestion: AdminQuestion | undefined = editingQuestion
  ? {
      ...editingQuestion,
      createdAt: editingQuestion.createdAt
        ? Timestamp.fromDate(editingQuestion.createdAt)
        : undefined,
      updatedAt: editingQuestion.updatedAt
        ? Timestamp.fromDate(editingQuestion.updatedAt)
        : undefined,
    }
  : undefined;


  const handleQuestionSuccess = (questionId: string) => {
    // Trigger refresh of questions list
    setRefreshTrigger(prev => prev + 1);

    // Switch to manage tab to see the new question
    setActiveTab('manage');
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setActiveTab('add');
  };

  return (
    <div className="flex min-h-screen">
      <AutoNotification />

      {/* Sidebar */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex flex-col bg-[#202020] flex-1 transition-all duration-300">
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">🦇 Admin Panel - Question Management</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-gray-600 rounded-lg">
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
                >
                  {editingQuestion ? '✏️ Edit Question' : '➕ Add Question'}
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
                >
                  📋 Manage Questions
                </TabsTrigger>
              </TabsList>

              {/* Add Question Tab */}
<TabsContent value="add" className="mt-6">
  <QuestionEditor
    initialQuestion={adminEditingQuestion}
    onSuccess={handleQuestionSuccess}
  />
</TabsContent>


              {/* Manage Questions Tab */}
              <TabsContent value="manage" className="mt-6">
                <QuestionsList
                  onEdit={handleEditQuestion}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
