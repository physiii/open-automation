Name:           libaacplus
Version:        2.0.2
Release:        0
URL:            http://217.20.164.161/~tipok/aacplus
Group:          System/Libraries
License:        Commercial
Summary:        High Efficiency Advanced Audio Codec v2 (HE-AAC+)
Source:         http://217.20.164.161/~tipok/aacplus/%{name}-%{version}.tar.gz
Autoreqprov:    on
BuildRoot:      %{_tmppath}/%{name}-%{version}-build

%description
High Efficiency Advanced Audio Codec v2 (he-aac+) encoder library.
(3GPP TS 26.410 V8.0.0)

http://www.3gpp.org/ftp/Specs/html-info/26410.htm

%package devel
Group:          System/Libraries
Summary:        High Efficiency Advanced Audio Codec v2
Requires:       %{name} = %{version} glibc-devel

%description devel
High Efficiency Advanced Audio Codec v2 (he-aac+) encoder library.
(3GPP TS 26.410 V8.0.0)

http://www.3gpp.org/ftp/Specs/html-info/26410.htm

%prep
%setup -q

%build
%configure
make %{?jobs:-j %jobs}
#make distcheck

%install
%makeinstall

%clean
rm -rf $RPM_BUILD_ROOT

%post
%run_ldconfig

%postun
%run_ldconfig

%files
%defattr (-, root, root)
%doc AUTHORS ChangeLog COPYING NEWS README TODO
%{_bindir}/*
%{_libdir}/*.so.*

%files devel
%defattr (-, root, root)
%{_includedir}/aacplus.h
%{_libdir}/*.so
%{_libdir}/*.*a
