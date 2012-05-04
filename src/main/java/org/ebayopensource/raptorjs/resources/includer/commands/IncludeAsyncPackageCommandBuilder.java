package org.ebayopensource.raptorjs.resources.includer.commands;

import org.ebayopensource.raptorjs.resources.includer.ResourceIncluderContext;

public interface IncludeAsyncPackageCommandBuilder {
    IncludeCommand build(String requirePath, String packagePath, ResourceIncluderContext context);
}