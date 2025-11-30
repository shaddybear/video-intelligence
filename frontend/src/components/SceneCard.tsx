interface SceneCardProps {
    scene: {
        index: number;
        start_time: number;
        end_time: number;
        description?: string;
        actions?: string[];
        people_count?: number;
        environment?: string;
    };
    isActive: boolean;
    onJumpTo: (time: number) => void;
}

const actionIcons: Record<string, string> = {
    walking: '🚶',
    running: '🏃',
    sitting: '🪑',
    standing: '🧍',
    playing: '⚽',
    talking: '💬',
    riding: '🚴',
    fighting: '🥊',
    dancing: '💃',
};

export default function SceneCard({ scene, isActive, onJumpTo }: SceneCardProps) {
    return (
        <button
            onClick={() => onJumpTo(scene.start_time)}
            className={`group relative p-5 rounded-2xl text-left transition-all duration-500 border overflow-hidden ${isActive
                    ? 'bg-blue-600/30 border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-102'
                }`}
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? 'opacity-50' : ''}`} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className={`text-lg font-bold ${isActive ? 'text-blue-300' : 'text-gray-200 group-hover:text-white'}`}>
                            Scene {scene.index + 1}
                        </span>
                        {scene.environment && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {scene.environment}
                            </span>
                        )}
                    </div>
                    {scene.people_count !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <span className="text-sm">👥</span>
                            <span className="text-xs font-semibold text-blue-300">{scene.people_count}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {scene.actions && scene.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {scene.actions.map((action, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs flex items-center gap-1"
                            >
                                <span>{actionIcons[action] || '⭐'}</span>
                                <span className="text-green-200 capitalize">{action}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Description */}
                {scene.description && (
                    <p className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-2">
                        {scene.description}
                    </p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-600'
                            }`}
                        style={{ width: isActive ? '100%' : '0%' }}
                    />
                </div>

                {/* Timestamp */}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 font-mono">
                        {scene.start_time.toFixed(1)}s - {scene.end_time.toFixed(1)}s
                    </span>
                    <span className="text-xs text-gray-600">
                        {(scene.end_time - scene.start_time).toFixed(1)}s
                    </span>
                </div>
            </div>

            {/* Active indicator */}
            {isActive && (
                <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
            )}
        </button>
    );
}
