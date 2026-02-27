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
  const [scrolled, setScrolled] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-[#202020]">
      <AutoNotification />

      {/* Sidebar (Part of Flex Layout — Not Fixed) */}
      <div className="h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Header */}
        <div className="sticky top-0 z-40">
          <HeaderApp />
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden gap-6">
          
          {/* Left Subject Tree */}
          <div className="hidden lg:flex lg:w-1/4 flex-col border-r border-white/10 p-6 min-w-0">
            <div className="glassmorphism-dark rounded-lg border border-white/10 p-4  overflow-y-auto">
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

          {/* Right Scrollable Section */}
          <div
            className="flex-1 flex flex-col overflow-y-auto pr-6 min-w-0"
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop;
              setScrolled(scrollTop > 40);
            }}
          >
            {/* Title (Fades Smoothly) */}
            <div
              className={`pt-6 transition-all duration-300 ${
                scrolled
                  ? "opacity-0 -translate-y-4 h-0 overflow-hidden"
                  : "opacity-100 mb-6"
              }`}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Practice Questions
              </h1>
              <p className="text-white/60">
                Master your skills with our curated MCQ questions
              </p>
            </div>

            {/* Sticky Filter Panel */}
            <div className="sticky top-0 z-30 bg-[#202020]/80 backdrop-blur-md py-4">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Questions */}
            <div className="flex-1 pb-10">
              <QuestionArea filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}