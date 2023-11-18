import React from 'react';

export const skeletonList = () => {
    return (
        <div role="status" class="w-full p-4 space-y-4  rounded animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div>
                    <div class="h-2.5 bg-discordDarkGray rounded-full  w-24 mb-2.5"></div>
                    <div class="w-32 h-2 bg-discordGray rounded-full "></div>
                </div>
                <div class="h-2.5 bg-discordDarkGray rounded-full  w-12"></div>
            </div>
            <span class="sr-only">Loading...</span>
        </div>
    );
};




export const skeletonGraph = (chartHeightStr) => {
    return (
        <div role="status" style={{ 'height': chartHeightStr }} class={`flex items-center justify-center w-full bg-discordGray rounded animate-pulse`}>
            <i class="bg-discordDarkGray rounded py-2 px-4 bi bi-graph-up"></i>
            <span class="sr-only">Loading...</span>
        </div>
    );
}