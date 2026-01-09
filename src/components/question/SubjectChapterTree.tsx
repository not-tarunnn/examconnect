'use client';

import { useState } from 'react';
import { Subject, Topic } from '@/types/question';
import { ChevronDown, BookOpen, Leaf, FlaskConical, Atom, Bug, } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubjectChapterTreeProps {
  selectedSubject?: Subject;
  selectedChapter?: string;
  selectedTopic?: string;
  onSubjectSelect: (subject: Subject | undefined) => void;
  onChapterSelect: (chapter: string | undefined) => void;
  onTopicSelect: (topic: string | undefined) => void;
}

// Mock data - in production, fetch from Firebase
const SUBJECTS_DATA: Record<Subject, { chapters: Record<string, Topic[]> }> = {
  Botany: {
    chapters: {
      'Plant Morphology': [
        {
          id: 't1', name: 'Plant Tissues',
          chapterId: ''
        },
        {
          id: 't2', name: 'Meristems',
          chapterId: ''
        },
        {
          id: 't3', name: 'Root Structure',
          chapterId: ''
        },
      ],
      'Plant Physiology': [
        {
          id: 't4', name: 'Photosynthesis',
          chapterId: ''
        },
        {
          id: 't5', name: 'Respiration',
          chapterId: ''
        },
        {
          id: 't6', name: 'Transpiration',
          chapterId: ''
        },
      ],
      'Plant Reproduction': [
        {
          id: 't7', name: 'Pollination',
          chapterId: ''
        },
        {
          id: 't8', name: 'Fertilization',
          chapterId: ''
        },
      ],
    },
  },
  Chemistry: {
    chapters: {
      'Atomic Structure': [
        {
          id: 't9', name: 'Atoms & Molecules',
          chapterId: ''
        },
        {
          id: 't10', name: 'Electron Configuration',
          chapterId: ''
        },
        {
          id: 't11', name: 'Quantum Numbers',
          chapterId: ''
        },
      ],
      'Chemical Bonding': [
        {
          id: 't12', name: 'Ionic Bonding',
          chapterId: ''
        },
        {
          id: 't13', name: 'Covalent Bonding',
          chapterId: ''
        },
        {
          id: 't14', name: 'Metallic Bonding',
          chapterId: ''
        },
      ],
      'Thermodynamics': [
        {
          id: 't15', name: 'Entropy',
          chapterId: ''
        },
        {
          id: 't16', name: 'Enthalpy',
          chapterId: ''
        },
      ],
    },
  },
  Physics: {
    chapters: {
      'Mechanics': [
        {
          id: 't17', name: 'Motion',
          chapterId: ''
        },
        {
          id: 't18', name: 'Forces',
          chapterId: ''
        },
        {
          id: 't19', name: 'Energy',
          chapterId: ''
        },
      ],
      'Thermodynamics': [
        {
          id: 't20', name: 'Heat Transfer',
          chapterId: ''
        },
        {
          id: 't21', name: 'Temperature',
          chapterId: ''
        },
      ],
      'Waves & Sound': [
        {
          id: 't22', name: 'Wave Properties',
          chapterId: ''
        },
        {
          id: 't23', name: 'Sound Waves',
          chapterId: ''
        },
      ],
    },
  },
  Zoology: {
    chapters: {
      'Cell Biology': [
        {
          id: 't24', name: 'Cell Structure',
          chapterId: ''
        },
        {
          id: 't25', name: 'Cell Division',
          chapterId: ''
        },
      ],
      'Genetics': [
        {
          id: 't26', name: 'Mendelian Inheritance',
          chapterId: ''
        },
        {
          id: 't27', name: 'DNA Replication',
          chapterId: ''
        },
      ],
      'Animal Physiology': [
        {
          id: 't28', name: 'Nervous System',
          chapterId: ''
        },
        {
          id: 't29', name: 'Digestive System',
          chapterId: ''
        },
      ],
    },
  },
};

const SUBJECTS: Subject[] = ['Botany', 'Chemistry', 'Physics', 'Zoology'];
const SUBJECT_ICONS: Record<Subject, React.ElementType> = {
  Botany: Leaf,          // plant biology
  Chemistry: FlaskConical, // lab chemistry
  Physics: Atom,         // physics concepts
  Zoology: Bug,          // animal biology (outline)
};


export default function SubjectChapterTree({
  selectedSubject,
  selectedChapter,
  selectedTopic,
  onSubjectSelect,
  onChapterSelect,
  onTopicSelect,
}: SubjectChapterTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (chapter: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapter)) {
      newExpanded.delete(chapter);
    } else {
      newExpanded.add(chapter);
    }
    setExpandedChapters(newExpanded);
  };

  const handleChapterClick = (chapter: string) => {
    onChapterSelect(chapter);
    toggleChapter(chapter);
  };

  const currentSubjectData = selectedSubject ? SUBJECTS_DATA[selectedSubject] : null;
  const chapters = currentSubjectData ? Object.keys(currentSubjectData.chapters) : [];

return (
  <div className="space-y-2">
    {/* Subjects */}
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/70 uppercase px-2">
        Subjects
      </h3>

      {SUBJECTS.map((subject) => {
        const Icon = SUBJECT_ICONS[subject];

        return (
          <motion.button
            key={subject}
            whileHover={{ x: 4 }}
            onClick={() => onSubjectSelect(subject)}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center gap-3 group ${
              selectedSubject === subject
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <Icon
              size={16}
              strokeWidth={1.6}
              className="flex-shrink-0"
            />
            <span className="font-medium text-sm">{subject}</span>
          </motion.button>
        );
      })}
    </div>
      {/* Chapters & Topics */}
      {selectedSubject && chapters.length > 0 && (
        <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
          <h3 className="text-xs font-semibold text-white/70 uppercase px-2">
            Chapters
          </h3>
          {chapters.map((chapter) => {
            const isExpanded = expandedChapters.has(chapter);
            const topics = SUBJECTS_DATA[selectedSubject].chapters[chapter];

            return (
              <div key={chapter} className="space-y-1">
                {/* Chapter Header */}
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleChapterClick(chapter)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between group ${
                    selectedChapter === chapter
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium text-sm">{chapter}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </motion.button>

                {/* Topics */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pl-4 space-y-1"
                  >
                    {topics.map((topic) => (
                      <motion.button
                        key={topic.id}
                        whileHover={{ x: 4 }}
                        onClick={() => onTopicSelect(topic.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                          selectedTopic === topic.name
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {topic.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Selections */}
      {(selectedSubject || selectedChapter || selectedTopic) && (
        <button
          onClick={() => {
            onSubjectSelect(undefined);
            onChapterSelect(undefined);
            onTopicSelect(undefined);
            setExpandedChapters(new Set());
          }}
          className="w-full mt-4 px-3 py-2 rounded-lg border border-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors text-center"
        >
          Clear Selections
        </button>
      )}
    </div>
  );
}
