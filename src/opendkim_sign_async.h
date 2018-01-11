#ifndef _OPENDKIMSIGNASYNC_H
#define _OPENDKIMSIGNASYNC_H

#include "opendkim_async.h"

class OpenDKIMSignAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMSignAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::SignArgs(
        info,
        &obj,
        &id,
        &secretkey,
        &selector,
        &domain,
        &hdrcanon,
        &bodycanon,
        &signalg,
        &length
      );
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    char *id;
    char *secretkey;
    char *selector;
    char *domain;
    char *hdrcanon;
    char *bodycanon;
    char *signalg;
    int length;
};

#endif /* _OPENDKIMSIGNASYNC_ */
