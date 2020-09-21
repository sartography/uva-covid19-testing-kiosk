#include "pch.h"
#include "ReactPackageProvider.h"
#include "NativeModules.h"


using namespace winrt::Microsoft::ReactNative;

namespace winrt::uva_covid19_testing_kiosk::implementation
{

void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
{
    AddAttributedModules(packageBuilder);
}

} // namespace winrt::uva_covid19_testing_kiosk::implementation


