import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutList, MessageSquare } from 'lucide-react';

import { usePersonDetails } from '../../hooks/usePersonDetails';
import PersonHeader from '../../components/PersonDetails/PersonHeader';
import PersonBio from '../../components/PersonDetails/PersonBio';
import PersonFilmography from '../../components/PersonDetails/PersonFilmography';
import PersonInfo from '../../components/PersonDetails/PersonInfo';
import PersonReviewsSection from '../../components/PersonDetails/PersonReviewsSection';
import PersonImages from '../../components/PersonDetails/PersonImages';

const PersonDetails = () => {
  const { id } = useParams();
  const { details, reviews, loading, actions } = usePersonDetails(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full overflow-x-hidden animate-in fade-in duration-700 bg-zinc-950 min-h-screen">
      
      <PersonHeader details={details} />

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 max-w-[1600px] mx-auto px-6 md:px-12 relative z-20 -mt-10 md:mt-0">
        
        <div className="hidden lg:block">
           <PersonInfo details={details} />
        </div>

        <div className="w-full">
            
            <div className="flex gap-8 border-b border-white/10 mb-10 sticky top-20 bg-zinc-950/90 backdrop-blur-xl z-30 pt-4 px-2">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all relative ${activeTab === 'overview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <LayoutList size={18} /> Visão Geral
                    {activeTab === 'overview' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all relative ${activeTab === 'reviews' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <MessageSquare size={18} /> Comentários
                    <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs border border-white/5">{reviews.length}</span>
                    {activeTab === 'reviews' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                    )}
                </button>
            </div>

            <div className="lg:hidden mb-8">
                <PersonInfo details={details} />
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-2">
                        <PersonBio biography={details.biography} />
                        
                        {details.images && (
                            <PersonImages images={details.images} name={details.name} />
                        )}

                        <PersonFilmography credits={details.combined_credits} />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PersonReviewsSection 
                            reviews={reviews}
                            onPostReview={actions.handlePostReview}
                            onReply={actions.handlePostReply}
                            onDelete={actions.handleDeleteReview}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;