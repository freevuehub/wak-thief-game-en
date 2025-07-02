import React, { useState, useEffect } from 'react';
import { Thief, Sector, GamePhase, ThiefStatus, ThiefAction, NewsItem } from './types';
import { INITIAL_CASH, SECTOR_COUNT, DAILY_COST_PER_THIEF, RECRUITMENT_COST } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import ThiefCreation from './components/ThiefCreation';
import MapView from './components/MapView';
import EndOfDayReport from './components/EndOfDayReport';
import ThiefRoster from './components/ThiefRoster';
import GameOver from './components/GameOver';
import ConversationView from './components/ConversationView';
import { generateDailyDialogue, generateNewsReport } from './services/geminiService';

const App: React.FC = () => {
    const [thieves, setThieves] = useState<Thief[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [cash, setCash] = useState(INITIAL_CASH);
    const [day, setDay] = useState(1);
    const [globalAlert, setGlobalAlert] = useState(10);
    const [newsLog, setNewsLog] = useState<NewsItem[]>([]);
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Recruitment);
    
    const [activeConversationThiefId, setActiveConversationThiefId] = useState<string | null>(null);
    const [thiefToAssignMap, setThiefToAssignMap] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<ThiefAction | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const [showRecruit, setShowRecruit] = useState(false);
    const [dailyReportData, setDailyReportData] = useState<{ report: string, income: number, expenses: number } | null>(null);


    useEffect(() => {
        const initialSectors = Array.from({ length: SECTOR_COUNT }, (_, i) => ({
            id: i,
            name: `Sector ${String.fromCharCode(65 + i)}`,
            alertLevel: Math.random() * 20,
            baseLoot: 1000 + Math.floor(Math.random() * 1500),
        }));
        setSectors(initialSectors);
    }, []);

    const handleThiefCreation = (newThiefData: Omit<Thief, 'id' | 'recruitedOnDay'> | null) => {
        if(newThiefData) {
            const cost = thieves.length > 0 ? RECRUITMENT_COST : 0;
            if (cash < cost) {
                alert("Not enough funds to recruit a new member.");
                setShowRecruit(false);
                return;
            }
            const newThief: Thief = {
                ...newThiefData,
                id: `thief-${Date.now()}`,
                recruitedOnDay: day,
                status: ThiefStatus.Recruited,
            };
            setThieves(prev => [...prev, newThief]);
            setCash(c => c - cost);
            addNews(`New member ${newThief.name} has joined.`, 'system');
        }
        setShowRecruit(false);
        if (gamePhase === GamePhase.Recruitment) {
            setGamePhase(GamePhase.Assignment);
        }
    };

    const handleActionConfirmed = (thiefId: string, action: ThiefAction, sectorId?: number) => {
        if (action === ThiefAction.Steal || action === ThiefAction.Scout) {
            setPendingAction(action);
            setThiefToAssignMap(thiefId);
            setGamePhase(GamePhase.MapSelection);
            setShowMap(true);
        } else {
            setThieves(prev => prev.map(t => t.id === thiefId ? { ...t, action } : t));
        }
        setActiveConversationThiefId(null);
    }


    const handleSelectSector = (sectorId: number) => {
        if (!thiefToAssignMap || pendingAction === null) return;

        setThieves(prev => prev.map(t => t.id === thiefToAssignMap ? { ...t, action: pendingAction, assignedSectorId: sectorId } : t));
        setThiefToAssignMap(null);
        setPendingAction(null);
        setGamePhase(GamePhase.Assignment);
        setShowMap(false);
    };
    
    const addNews = (message: string, type: NewsItem['type']) => {
        setNewsLog(prev => [{ day, message, type }, ...prev]);
    }

    const handleEndDay = async () => {
        setGamePhase(GamePhase.EndOfDay);

        let dailyEventMessagesForReport: string[] = [];
        let dailyEventsForLog: NewsItem[] = [];
        let newCash = cash;
        let newGlobalAlert = globalAlert;
        let dailyIncome = 0;
        let dailyExpenses = 0;

        const activeThievesForCost = thieves.filter(t => t.status !== ThiefStatus.Arrested && t.status !== ThiefStatus.Executed);
        const livingCosts = activeThievesForCost.length * DAILY_COST_PER_THIEF;
        if(activeThievesForCost.length > 0) {
            newCash -= livingCosts;
            dailyExpenses += livingCosts;
        }

        const updatedThieves = [...thieves];
        const updatedSectors = [...sectors];
        
        for(let i=0; i < updatedThieves.length; i++){
            const thief = updatedThieves[i];
            if (thief.action === undefined) continue;

            let updatedThief = { ...thief };
            let reportMsg = "";
            let eventNarration = "";

            switch(thief.action) {
                case ThiefAction.Rest:
                    updatedThief.condition = Math.min(100, thief.condition + 30);
                    reportMsg = `${thief.name} took a rest.`;
                    eventNarration = `${thief.name} rested and recovered their condition. (Condition +30)`;
                    dailyEventsForLog.push({day, message: eventNarration, type: 'neutral'});
                    break;
                case ThiefAction.Steal:
                    const sector = updatedSectors.find(s => s.id === thief.assignedSectorId)!;
                    const successChance = (thief.heistSuccessRate * (thief.condition / 100)) - sector.alertLevel;
                    if (Math.random() * 100 < successChance) {
                        const loot = Math.floor(sector.baseLoot * (1 - (sector.alertLevel / 200)));
                        newCash += loot;
                        dailyIncome += loot;
                        updatedThief.loyalty = Math.min(100, thief.loyalty + 5);
                        reportMsg = `Successfully stole $${loot.toLocaleString()} from ${sector.name} sector.`;
                        eventNarration = `${thief.name} stole $${loot.toLocaleString()} from ${sector.name} sector. (Loyalty +5)`;
                        dailyEventsForLog.push({day, message: eventNarration, type: 'success'});
                        sector.alertLevel = Math.min(100, sector.alertLevel + 10);
                        newGlobalAlert = Math.min(100, newGlobalAlert + 2);
                    } else {
                        updatedThief.loyalty = Math.max(0, thief.loyalty - 10);
                        reportMsg = `${thief.name}'s operation in ${sector.name} sector failed.`;
                        eventNarration = `${reportMsg} (Loyalty -10)`;
                        dailyEventsForLog.push({day, message: eventNarration, type: 'failure'});
                        sector.alertLevel = Math.min(100, sector.alertLevel + 15);
                        newGlobalAlert = Math.min(100, newGlobalAlert + 5);
                        
                        if (Math.random() * 100 < sector.alertLevel / 2) {
                            updatedThief.status = ThiefStatus.Arrested;
                            reportMsg += ` Furthermore, ${thief.name} has been arrested by the police!`;
                            eventNarration = `${thief.name} was arrested by the police after a failed operation. The syndicate has taken a major blow.`;
                            dailyEventsForLog.push({day, message: eventNarration, type: 'arrest'});
                            newGlobalAlert = Math.min(100, newGlobalAlert + 15);
                        }
                    }
                    updatedThief.condition = Math.max(0, thief.condition - 20);
                    break;
                case ThiefAction.Execute:
                     updatedThief.status = ThiefStatus.Executed;
                     reportMsg = `${thief.name} was eliminated due to internal syndicate affairs.`;
                     eventNarration = `By the Boss's order, ${thief.name} was executed. Other members are now more obedient out of fear.`;
                     dailyEventsForLog.push({day, message: eventNarration, type: 'system'});
                     updatedThieves.forEach((t) => {
                         if(t.id !== thief.id && t.status !== ThiefStatus.Arrested && t.status !== ThiefStatus.Executed) {
                            t.loyalty = Math.min(100, t.loyalty + 15);
                            t.heistSuccessRate = Math.max(10, t.heistSuccessRate - 5);
                         }
                     });
                     break;
                case ThiefAction.Scout:
                    const scoutedSector = updatedSectors.find(s => s.id === thief.assignedSectorId)!;
                    scoutedSector.scoutedInfo = `Alert ${Math.round(scoutedSector.alertLevel)}%, Est. Loot $${scoutedSector.baseLoot.toLocaleString()}`;
                    scoutedSector.lastScoutedDay = day;
                    reportMsg = `${thief.name} scouted the ${scoutedSector.name} sector.`;
                    eventNarration = `${thief.name} scouted the ${scoutedSector.name} sector and brought back new information.`;
                    dailyEventsForLog.push({day, message: eventNarration, type: 'neutral'});
                    updatedThief.condition = Math.max(0, thief.condition - 10);
                    break;
            }
            dailyEventMessagesForReport.push(reportMsg);
            updatedThieves[i] = updatedThief;
        }

        const newsReportText = await generateNewsReport(dailyEventMessagesForReport);
        
        setDailyReportData({
            report: newsReportText,
            income: dailyIncome,
            expenses: dailyExpenses + livingCosts
        });
        
        const finalCash = newCash;
        if (finalCash < 0) {
            setCash(finalCash);
            setGamePhase(GamePhase.GameOver);
            return;
        }

        const dialogueUpdatePromises = updatedThieves.map((thief, index) => {
            if (thief.status !== ThiefStatus.Arrested && thief.status !== ThiefStatus.Executed) {
                 const eventSummary = dailyEventsForLog.find(e => e.message.includes(thief.name))?.message || "Had a quiet day yesterday.";
                 return generateDailyDialogue(thief, eventSummary)
                    .then(briefing => {
                        updatedThieves[index].openingNarration = briefing.narration;
                        updatedThieves[index].dialogue = briefing.dialogue;
                    }).catch(err => console.error("Dialogue generation failed for", thief.name, err));
            }
            return Promise.resolve();
        });

        await Promise.all(dialogueUpdatePromises);

        updatedThieves.forEach(thief => {
            if (thief.status !== ThiefStatus.Arrested && thief.status !== ThiefStatus.Executed) {
                thief.action = undefined;
            }
            if(thief.status === ThiefStatus.Recruited) {
                thief.status = ThiefStatus.Idle;
            }
        });
        
        setThieves(updatedThieves);
        setSectors(updatedSectors);
        setCash(finalCash);
        setGlobalAlert(newGlobalAlert);
        setDay(d => d + 1);
        setNewsLog(prev => [...dailyEventsForLog.reverse(), ...prev]);
    };

    const activeThieves = thieves.filter(t => t.status !== ThiefStatus.Arrested && t.status !== ThiefStatus.Executed);
    const unassignedThieves = activeThieves.filter(t => t.recruitedOnDay < day && t.action === undefined);
    const allTasksAssigned = unassignedThieves.length === 0;
    
    if (gamePhase === GamePhase.Recruitment && thieves.length === 0) {
        return <ThiefCreation onThiefCreated={handleThiefCreation} isFirstThief={true} />;
    }

    const avgLoyalty = activeThieves.length > 0 ? activeThieves.reduce((acc, t) => acc + t.loyalty, 0) / activeThieves.length : 0;
    const conversationThief = thieves.find(t => t.id === activeConversationThiefId);
    
    return (
        <div className="relative min-h-screen bg-gray-900 text-gray-200">
            <Header cash={cash} globalAlertLevel={globalAlert} thiefCount={activeThieves.length} averageLoyalty={avgLoyalty} />
            <div className="flex h-screen pt-20 pb-[68px]">
                <aside className="w-80 flex-shrink-0 bg-gray-800/50 border-r border-gray-700 flex flex-col">
                    <ThiefRoster 
                        thieves={thieves} 
                        onSelectThief={(id) => setActiveConversationThiefId(id)}
                        day={day}
                    />
                    <div className="p-4 mt-auto border-t border-gray-700/50">
                        <button onClick={() => setShowRecruit(true)} className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-md transition-colors font-bold">Recruit New Member</button>
                    </div>
                </aside>
                
                <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h5m-5 4h5" /></svg>
                        <h2 className="text-3xl font-display text-gray-400">
                            {allTasksAssigned ? "All orders have been given, Boss." : "Awaiting Orders"}
                        </h2>
                        <p className="mt-2 max-w-md mx-auto">
                            {allTasksAssigned ? "End the day to commence operations." : "Select a member from the roster on the left to begin the briefing and assign a task."}
                        </p>
                    </div>
                </main>
            </div>
            
            {conversationThief && (
                <ConversationView 
                    thief={conversationThief}
                    onClose={() => setActiveConversationThiefId(null)}
                    onActionConfirmed={handleActionConfirmed}
                />
            )}

            {showRecruit && <ThiefCreation onThiefCreated={handleThiefCreation} isFirstThief={thieves.length === 0} />}
            {gamePhase === GamePhase.GameOver && <GameOver />}
            {showMap && <MapView sectors={sectors} onClose={() => { setShowMap(false); setGamePhase(GamePhase.Assignment); }} isSelectionMode={gamePhase === GamePhase.MapSelection} onSelectSector={handleSelectSector} day={day}/>}
            {showNews && <EndOfDayReport news={newsLog} onClose={() => setShowNews(false)} day={day-1} isSettlement={false} />}
            {gamePhase === GamePhase.EndOfDay && dailyReportData && (
                 <EndOfDayReport 
                    reportData={dailyReportData}
                    onClose={() => {
                        setGamePhase(GamePhase.Assignment);
                        setDailyReportData(null);
                    }}
                    day={day}
                    isSettlement={true}
                 />
            )}

            <Footer 
                day={day} 
                onEndDay={handleEndDay} 
                isEndDayDisabled={!allTasksAssigned || gamePhase === GamePhase.EndOfDay}
                onToggleMap={() => setShowMap(!showMap)}
                onToggleNews={() => setShowNews(!showNews)}
            />
        </div>
    );
};

export default App;