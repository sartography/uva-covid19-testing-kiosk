#pragma once

#include "winrt/Microsoft.ReactNative.h"


namespace winrt::uva_covid19_testing_kiosk::implementation
{
    struct ReactPackageProvider : winrt::implements<ReactPackageProvider, winrt::Microsoft::ReactNative::IReactPackageProvider>
    {
    public: // IReactPackageProvider
        void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept;
    };
} // namespace winrt::uva_covid19_testing_kiosk::implementation


