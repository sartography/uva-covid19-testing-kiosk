#pragma once

#include "winrt/Microsoft.ReactNative.h"


namespace winrt::uva-covid19-testing-kiosk::implementation
{
    struct ReactPackageProvider : winrt::implements<ReactPackageProvider, winrt::Microsoft::ReactNative::IReactPackageProvider>
    {
    public: // IReactPackageProvider
        void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept;
    };
} // namespace winrt::uva-covid19-testing-kiosk::implementation


