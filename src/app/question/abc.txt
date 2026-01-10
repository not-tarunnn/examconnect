"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import AutoNotification from "@/components/AutoNotification";
import QuestionArea from "@/components/question/QuestionArea";
import SubjectChapterTree from "@/components/question/SubjectChapterTree";
import FilterPanel from "@/components/question/FilterPanel";
import { Subject, FilterOptions } from "@/types/question";

export default function QuestionPage() {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleSubjectSelect = (subject: Subject | undefined) => {
    setFilters((prev) => ({
      ...prev,
      subject,
      chapter: undefined,
      topic: undefined,
    }));
  };

  const handleChapterSelect = (chapter: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      chapter,
      topic: undefined,
    }));
  };

  const handleTopicSelect = (topic: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      topic,
    }));
  };

  return (
    <div className="flex min-h-screen">
      <AutoNotification />
      {/* Sidebar */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col bg-[#202020] flex-1 transition-all duration-300 pl-0 sm:pl-0">
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Practice Questions</h1>
              <p className="text-white/60">Master your skills with our curated MCQ questions</p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Subject/Chapter Tree */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="glassmorphism-dark rounded-lg border border-white/10 p-4">
                    <SubjectChapterTree
                      selectedSubject={filters.subject}
                      selectedChapter={filters.chapter}
                      selectedTopic={filters.topic}
                      onSubjectSelect={handleSubjectSelect}
                      onChapterSelect={handleChapterSelect}
                      onTopicSelect={handleTopicSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Right Content - Filters and Questions */}
              <div className="lg:col-span-3 space-y-6">
                {/* Filter Panel */}
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                />

                {/* Question Area */}
                <QuestionArea filters={filters} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
